from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import uvicorn
import json
import time

app = FastAPI(title="FrijolAI - Servicio de IA", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PlantVillage classes for bean diseases (simplified)
PLANT_CLASSES = {
    0: "Bean_angular_leaf_spot",
    1: "Bean_bacterial_blight", 
    2: "Bean_bean_rust",
    3: "Bean_common_bacterial_blight",
    4: "Bean_healthy",
    5: "Bean_web_blight"
}

# Severity mapping
SEVERITY_MAP = {
    "Bean_healthy": "low",
    "Bean_angular_leaf_spot": "medium",
    "Bean_bacterial_blight": "high",
    "Bean_bean_rust": "medium",
    "Bean_common_bacterial_blight": "high",
    "Bean_web_blight": "medium"
}

# Image transforms for preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class MockModel:
    """Mock model that simulates PlantVillage predictions"""
    
    def __init__(self):
        self.classes = list(PLANT_CLASSES.values())
    
    def predict(self, image_tensor):
        # Simulate model inference with realistic results
        import random
        import numpy as np
        
        # Create mock predictions with realistic probabilities
        predictions = np.random.dirichlet([1, 1, 1, 1, 0.5, 1], size=1)[0]
        
        # Make one prediction significantly higher (simulate real model behavior)
        max_idx = np.random.choice(len(predictions), p=[0.3, 0.25, 0.25, 0.15, 0.03, 0.02])
        predictions[max_idx] = max(predictions[max_idx], 0.6 + random.uniform(0, 0.3))
        
        # Normalize
        predictions = predictions / predictions.sum()
        
        return torch.tensor(predictions)

# Initialize mock model (in production, load actual PyTorch model)
model = MockModel()

@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "service": "FrijolAI AI Service",
        "version": "1.0.0",
        "model_classes": len(PLANT_CLASSES)
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """Analyze plant image for disease detection"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        start_time = time.time()
        
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocess image
        image_tensor = transform(image).unsqueeze(0)
        
        # Get predictions
        with torch.no_grad():
            outputs = model.predict(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=0)
        
        # Process results
        predictions = []
        for i, prob in enumerate(probabilities):
            class_name = PLANT_CLASSES[i]
            confidence = float(prob)
            
            predictions.append({
                "class": class_name,
                "confidence": confidence,
                "severity": SEVERITY_MAP.get(class_name, "medium"),
                "disease_type": "disease" if "healthy" not in class_name.lower() else "healthy"
            })
        
        # Sort by confidence
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Get top prediction
        top_prediction = predictions[0]
        
        processing_time = time.time() - start_time
        
        return {
            "success": True,
            "predictions": predictions[:3],  # Return top 3
            "top_prediction": {
                "class": top_prediction["class"],
                "confidence": top_prediction["confidence"],
                "severity": top_prediction["severity"],
                "disease_type": top_prediction["disease_type"]
            },
            "processing_time": round(processing_time, 2),
            "image_size": {
                "width": image.width,
                "height": image.height
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/model/info")
async def get_model_info():
    """Get information about the loaded model"""
    return {
        "model_type": "PlantVillage CNN (Simulated)",
        "classes": PLANT_CLASSES,
        "total_classes": len(PLANT_CLASSES),
        "input_size": [224, 224],
        "framework": "PyTorch",
        "description": "Modelo entrenado con dataset PlantVillage para detección de enfermedades en frijol"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)