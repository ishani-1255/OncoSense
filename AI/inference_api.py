import torch
import torchvision
import torchvision.transforms as transforms
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from io import BytesIO

# Define the ViT model class
class ViTForCancerClassification(torch.nn.Module):
    def __init__(self, num_classes):
        super(ViTForCancerClassification, self).__init__()
        self.vit = torchvision.models.vit_b_16(weights=torchvision.models.ViT_B_16_Weights.DEFAULT)
        in_features = self.vit.heads.head.in_features
        self.vit.heads.head = torch.nn.Linear(in_features, num_classes)
        
    def forward(self, x):
        return self.vit(x)

# Setup
num_classes = 32
device = 'cuda' if torch.cuda.is_available() else 'cpu'
class_names = [
    'Adrenocortical_carcinoma', 'Bladder_Urothelial_Carcinoma', 'Brain_Lower_Grade_Glioma', 
    'Breast_invasive_carcinoma', 'Cervical_squamous_cell_carcinoma_and_endocervical_adenocarcinoma',
    'Cholangiocarcinoma', 'Colon_adenocarcinoma', 'Esophageal_carcinoma', 'Glioblastoma_multiforme',
    'Head_and_Neck_squamous_cell_carcinoma', 'Kidney_Chromophobe', 'Kidney_renal_clear_cell_carcinoma',
    'Kidney_renal_papillary_cell_carcinoma', 'Liver_hepatocellular_carcinoma', 'Lung_adenocarcinoma', 
    'Lung_squamous_cell_carcinoma', 'Lymphoid_Neoplasm_Diffuse_Large_B-cell_Lymphoma', 'Mesothelioma', 
    'Ovarian_serous_cystadenocarcinoma', 'Pancreatic_adenocarcinoma', 'Pheochromocytoma_and_Paraganglioma',
    'Prostate_adenocarcinoma', 'Rectum_adenocarcinoma', 'Sarcoma', 'Skin_Cutaneous_Melanoma', 
    'Stomach_adenocarcinoma', 'Testicular_Germ_Cell_Tumors', 'Thymoma', 'Thyroid_carcinoma', 
    'Uterine_Carcinosarcoma', 'Uterine_Corpus_Endometrial_Carcinoma', 'Uveal_Melanoma'
]

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Initialize FastAPI
app = FastAPI()

def load_model(version: int):
    """Load model checkpoint based on version."""
    checkpoint_path = f'vit_cancer_model_state_dict_{version}.pth'
    model = ViTForCancerClassification(num_classes).to(device)
    model.load_state_dict(torch.load(checkpoint_path, map_location=device))
    model.eval()
    return model

# API endpoint for image classification
@app.post("/predict")
async def predict(file: UploadFile = File(...), version: int = Query(0, ge=0, le=6)):
    # Validate image format
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid image format. Only JPEG or PNG are allowed.")
    
    # Load model for specified version
    try:
        model = load_model(version)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Model version {version} not found.")
    
    # Read and preprocess image
    try:
        image = Image.open(BytesIO(await file.read())).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

    image_tensor = transform(image).unsqueeze(0).to(device)
    
    # Inference
    with torch.no_grad():
        output = model(image_tensor)
        _, predicted_idx = torch.max(output, 1)
        predicted_class = class_names[predicted_idx.item()]

    return {"predicted_class": predicted_class, "model_version": version}
