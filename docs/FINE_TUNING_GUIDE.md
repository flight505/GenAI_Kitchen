# Unoform Model Fine-Tuning Guide

This guide provides step-by-step instructions for training a custom Flux LoRA model with Unoform's signature style using Replicate's managed training services.

## Prerequisites

- 10-50 high-quality Unoform kitchen images
- Replicate account (https://replicate.com)
- ZIP file with your training images
- 30-60 minutes for training

## Quick Start

### Option 1: Fast Flux Trainer (Recommended)

1. **Prepare Images**
   - Collect 10-30 high-quality Unoform kitchen photos
   - Ensure images are at least 1024x1024 pixels
   - Create a ZIP file with all images

2. **Start Training**
   - Go to https://replicate.com/replicate/fast-flux-trainer/train
   - Upload your ZIP file
   - Set trigger word: `unoform`
   - Set steps: 1500 (good starting point)
   - Click "Start training"

3. **Wait for Results**
   - Training takes 20-40 minutes
   - You'll receive an email when complete
   - Test the model directly on Replicate

### Option 2: Flux Dev LoRA Trainer (Advanced)

Use this for more control over training parameters:
- URL: https://replicate.com/ostris/flux-dev-lora-trainer/train
- Allows customization of LoRA rank, learning rate, etc.
- Better for experimentation and optimization

## Detailed Instructions

### Step 1: Image Preparation

**Requirements:**
- **Quantity**: 10-30 images (20 is optimal)
- **Quality**: High resolution, sharp, well-lit
- **Diversity**: Different angles, lighting, kitchen styles
- **Consistency**: All should represent Unoform aesthetic

**File Naming:**
```
modern_white_kitchen_01.jpg
scandinavian_oak_kitchen_02.jpg
minimalist_black_kitchen_03.jpg
```

**Create ZIP Archive:**
```bash
# On Mac/Linux
zip -r unoform_training_images.zip *.jpg

# On Windows
# Right-click → Send to → Compressed folder
```

### Step 2: Training Configuration

**Recommended Settings:**

| Parameter | Recommended Value | Notes |
|-----------|------------------|-------|
| Trigger Word | `unoform` | Unique, short, memorable |
| Training Steps | 1500 | Start here, adjust if needed |
| Learning Rate | Auto/Default | Usually optimal |
| LoRA Rank | 32-64 | Higher for style training |
| Batch Size | 1 | Default is fine |

### Step 3: Start Training

1. **Navigate to Trainer**
   - Fast Flux: https://replicate.com/replicate/fast-flux-trainer/train
   - Advanced: https://replicate.com/ostris/flux-dev-lora-trainer/train

2. **Upload and Configure**
   - Click "Choose file" and select your ZIP
   - Enter trigger word: `unoform`
   - Set steps to 1500
   - Leave other settings as default

3. **Start Training**
   - Click "Start training"
   - Save the training URL for reference
   - Wait for email notification

### Step 4: Testing Your Model

Once training completes:

1. **Test Prompts**
   ```
   unoform kitchen with white cabinets and marble countertops
   unoform modern Scandinavian kitchen design
   unoform minimalist kitchen with oak elements
   unoform compact kitchen with integrated appliances
   ```

2. **Evaluate Results**
   - Check if style matches Unoform aesthetic
   - Verify trigger word activates the style
   - Test various kitchen descriptions

3. **Common Issues**
   - **Overfitting**: Images look exactly like training data
     - Solution: Reduce training steps to 1000
   - **Weak Style**: Not enough Unoform influence
     - Solution: Increase steps to 2000-2500
   - **Inconsistent**: Variable quality
     - Solution: Improve dataset quality/diversity

### Step 5: Create Custom Model

After successful training:

1. **Create Model on Replicate**
   - On training results page, click "Create model"
   - Name: `unoform-kitchen-style`
   - Visibility: Private (for Unoform only)
   - Description: "Unoform kitchen design style LoRA"

2. **Note Model Details**
   - Model URL: `username/unoform-kitchen-style`
   - Version ID: (automatically generated)
   - API endpoint for integration

### Step 6: Integration with GenAI Kitchen

1. **Update Model Configuration**

Edit `/app/generate/route.ts`:
```typescript
// Replace existing model version with your custom model
version: "your-username/unoform-kitchen-style:latest",
```

2. **Update Prompt Handling**

Ensure prompts include trigger word:
```typescript
// In promptTemplating.ts
export function enhancePromptWithUnoformStyle(prompt: string): string {
  if (!prompt.includes('unoform')) {
    return `unoform ${prompt}`;
  }
  return prompt;
}
```

3. **Test Integration**
   - Deploy to development environment
   - Test all features with new model
   - Compare results with base model

## Best Practices

### Dataset Quality

**Do:**
- Use official Unoform photography
- Include variety within brand guidelines
- Ensure consistent high quality
- Show different times of day/lighting

**Don't:**
- Include competitor kitchens
- Use low-resolution images
- Add watermarked photos
- Mix in non-kitchen images

### Training Tips

1. **Start Conservative**
   - Begin with 1000-1500 steps
   - Test thoroughly before increasing
   - Quality > Quantity for datasets

2. **Iterate Based on Results**
   - Too generic? Add more steps
   - Too specific? Reduce steps
   - Wrong style? Check dataset

3. **Document Everything**
   - Training parameters used
   - Dataset composition
   - Test results and feedback

## Troubleshooting

### Training Fails

**Error: "Invalid ZIP file"**
- Ensure ZIP contains only images
- No nested folders
- No hidden files (.DS_Store, etc.)

**Error: "Training timeout"**
- Reduce dataset size
- Check image dimensions
- Contact Replicate support

### Poor Results

**Issue: Doesn't look like Unoform**
1. Review training images - are they representative?
2. Check trigger word usage in prompts
3. Consider retraining with curated dataset

**Issue: Low quality outputs**
1. Ensure training images are high quality
2. Try different base model (Dev vs Schnell)
3. Adjust LoRA rank (try 64)

## Advanced Optimization

### A/B Testing Framework

1. **Create Multiple Versions**
   - Train with different step counts
   - Try various dataset compositions
   - Experiment with parameters

2. **Systematic Comparison**
   - Use consistent test prompts
   - Score on brand alignment (1-10)
   - Get design team feedback

3. **Production Deployment**
   - Choose best performing model
   - Document configuration
   - Set up monitoring

### Continuous Improvement

1. **Collect Feedback**
   - Track user satisfaction
   - Note style drift issues
   - Identify missing elements

2. **Periodic Retraining**
   - Add new Unoform designs
   - Refine based on feedback
   - Update trigger word if needed

## Support Resources

- **Replicate Discord**: https://discord.gg/replicate
- **Replicate Docs**: https://replicate.com/docs
- **Community Forum**: https://github.com/replicate/replicate/discussions

## Next Steps

After successful training:
1. ✅ Test model thoroughly
2. ✅ Create private model on Replicate
3. ✅ Integrate with GenAI Kitchen
4. ✅ Deploy to production
5. ✅ Monitor usage and gather feedback