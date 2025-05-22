# GenAI Kitchen Full Implementation Checklist

## Codebase Cleanup & Setup

* [x] **Upgrade Dependencies:** Update all NPM packages to latest compatible versions and run the dev server to ensure the app still builds/runs without errors.
* [x] **Remove Legacy Payment/Auth Code:** Eliminate any remnants of payment flows or authentication from the RoomGPT codebase (e.g. Stripe integration, subscription checks) if present – this project will start fresh without those features.
* [x] **Purge Unneeded Room Types/Themes:** Simplify the app to focus on kitchens. Remove or refactor generic *room* and *theme* selections (e.g. drop the `rooms` dropdown list and hard-code "Kitchen" as the room type) and delete any options not relevant to kitchens (gaming rooms, etc.). Update UI text to refer to "kitchen" instead of "room" throughout (e.g. homepage tagline, alt texts).
* [x] **Remove Obsolete Model References:** Delete or replace any references to older ML models (Stable Diffusion, ControlNet, etc.) that are no longer needed. For example, strip out comments or variables referring to ControlNet or the old replicate model version in the generation code.
* [x] **Clean Up Unused Components:** Identify and remove any unused components, utils, or CSS. For example, if there are leftover UI components from RoomGPT that are not needed (placeholders, demo content, etc.), safely delete them. Ensure all imports in files are actually used by the app.
* [x] **Update Branding & Assets:** Revise any RoomGPT-specific branding to match **GenAI Kitchen**. This includes replacing the homepage hero text ("dream rooms" etc.) with messaging about **kitchen** redesigns, and swapping out any example images if necessary (use representative kitchen photos). Remove or disable the Vercel deploy banner/link from the open-source project if not applicable to this deployment.

## Deployment on Vercel

* [x] **Vercel Project Setup:** Create a new project on Vercel and import the Git repository. Set the environment to production and configure the build settings (Next.js app) as needed.
* [x] **Environment Variables:** Add all required environment variables on Vercel. This includes the Replicate API token (`REPLICATE_API_KEY`), any Bytescale upload API keys (`NEXT_PUBLIC_UPLOAD_API_KEY`), Upstash Redis credentials (for rate limiting or data storage), etc. Ensure secrets are stored securely on Vercel.
* [x] **Configure Upstash (Rate Limiting):** If using Upstash Redis for rate limiting (as in the original code), ensure the Redis database is set up and the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are provided. Test that the rate limiter in the `/generate` route is functioning (e.g. limit of 5 requests/24h) or adjust as needed for the new use case.
* [x] **Update Model Versions:** Update all Replicate model versions to the latest available versions to ensure compatibility and optimal performance. This includes updating the Flux Canny Pro, Flux Fill Pro, and Flux Redux model versions in the respective API routes.
* [x] **Add Error Handling:** Enhance error handling in all API routes to better diagnose and troubleshoot issues. This includes proper error responses, timeout handling, and more detailed logging.
* [x] **Create Deployment Tests:** Develop and implement test scripts to validate the environment, API endpoints, and deployment configuration before deploying to production. This helps identify potential issues early in the development process.
* [x] **Create vercel.json:** Create a vercel.json configuration file to optimize the deployment settings, including environment variables, build commands, and resource allocation.
* [x] **Optimize next.config.js:** Update the Next.js configuration to include all necessary image domains, optimization settings, and performance enhancements for Vercel deployment.
* [x] **Deploy to Vercel:** Trigger the first deployment. Verify the build succeeds and the app loads on the Vercel preview URL. Test basic functionality (upload an image, ensure the generate API call runs). Monitor logs for any errors (missing environment vars, etc.) and fix any deployment-specific issues.
* [ ] **Custom Domain & HTTPS:** (If applicable) Configure the production domain for the app on Vercel and ensure SSL is working. Update any application URLs or callbacks to use the correct production URL.
* [ ] **Monitor Usage & Quotas:** Since Replicate API calls incur cost, set up monitoring/alerts for API usage. Consider implementing request tracking or integrating with Replicate's usage webhooks to watch the number of predictions. Also verify that the rate limiting (or any additional abuse prevention) is effective in the deployed environment.

## Integrate **Flux Canny Pro** for Structured Generation

* [x] **Replace Stable Diffusion API Calls:** Remove the existing image generation logic that calls the old Replicate model (Stable Diffusion ControlNet). In the Next.js API route (e.g. `/api/generate`), integrate calls to **Flux Canny Pro** instead.
* [x] **Use Replicate Flux Canny Pro Model:** Update the Replicate API POST request to use the Flux Canny Pro model endpoint (model name `black-forest-labs/flux-canny-pro`). Include the required inputs: the text prompt and the control image (the uploaded kitchen photo) as `control_image`. For example, use a JSON body like: `{ version: "<FluxCannyPro_model_version_id>", input: { prompt: "<generated prompt>", control_image: "<image_url>", steps: 30, guidance: 25 } }`.
* [x] **Remove Deprecated Inputs:** Drop any parameters that Flux Canny Pro doesn't need. For instance, the original code's `a_prompt` and `n_prompt` (positive/negative prompts) specific to Stable Diffusion can be removed or replaced with Flux's equivalents. Flux models have a `safety_tolerance` parameter for content filtering – you can set this to a permissive level (e.g. 2-5) since we're not expecting NSFW outputs.
* [x] **Edge Preservation:** Confirm that by providing the original image as `control_image`, the model preserves the kitchen's layout/edges. (Flux Canny Pro uses an internal Canny edge detector to guide generation, so no separate edge preprocessing is needed on our side.)
* [x] **Test Generation Flow:** Run an end-to-end test of the new generation route. Upload a sample kitchen image and use a simple prompt (e.g. "modern Scandinavian kitchen with white cabinets and oak floors"). The API should return a new image URL. Verify that the output stylistically matches the prompt while keeping the original kitchen structure (walls, cabinet layout) intact. Debug any issues (e.g. wrong parameter names or missing auth) until this works reliably.

## Add **Flux Fill Pro** Inpainting Feature

* [x] **Backend – New Inpaint Route:** Create a new Next.js API route (e.g. `app/inpaint/route.ts`) for inpainting operations. This route will accept: an input image (the current kitchen image to modify), a binary mask image (defining areas to change), and a text prompt describing the desired change. Use the Replicate API to call **Flux Fill Pro** (inpainting model) with these inputs.

  * [x] Implement the POST handler to read `imageUrl`, `maskImage` (could be a base64 string or URL), and `prompt` from the request JSON. The Replicate model name will be `black-forest-labs/flux-fill-pro` (verify the exact identifier and version on Replicate).
  * [x] Send the request to Replicate: the JSON body should include `"image": <image_url>`, `"mask": <mask_image>`, along with parameters like `prompt`, `steps` (e.g. 50 for finer detail), and `guidance` (Flux Fill Pro might use a lower guidance, e.g. 3.0, for subtle changes). Ensure the mask is in the correct format (typically white areas = regions to fill; if the model expects the inverse, invert the mask before sending).
  * [x] Poll the Replicate prediction endpoint for completion (similar to the generate route) and return the inpainted image URL in the response.
* [x] **Frontend – Mask Drawing UI:** Implement a drawing canvas overlay for the user to select areas of the image to change. When a generated kitchen image is displayed, provide a "Brush" or "Edit" mode:

  * [x] Use an HTML canvas or a canvas library where the user can draw with a semi-transparent brush over the image. The drawn mask should be white (or any color) where painted and black elsewhere. Provide basic controls like brush size and an eraser as needed.
  * [x] Ensure the canvas is the same dimensions as the displayed image and overlays exactly on top (to produce a mask aligned to the image pixels).
  * [x] Add a button like "Apply Inpaint" or "Refine Selection". On click, capture the canvas drawing as an image (e.g. use `canvas.toDataURL()` to get a base64 PNG).
  * [x] Call the new `/api/inpaint` route, sending the current image URL, the mask base64 (or upload it similarly to get a URL), and the user's text prompt for the change (e.g. "make the cabinets stainless steel").
* [x] **Integrate Inpainting Results:** When the inpaint API returns, replace the current image in the UI with the new image (the refined version). Clear the mask overlay (or hide it) and allow the user to continue making more edits if desired. The original image and prompt context should be preserved so that subsequent inpaintings continue to maintain the overall style.
* [x] **Quality Testing:** Try masking and editing various parts of a kitchen image (e.g. draw over the backsplash and prompt "change to white subway tiles"). Verify that Flux Fill Pro seamlessly fills in the masked area with the new detail, blending it naturally with the rest of the image. If the style of the edited region deviates, consider appending the style token or context to the inpaint prompt (e.g. include "<unoform>" or "in Unoform style" so the inpainted patch matches the overall design). Adjust mask inversion or prompt phrasing as needed based on results.

## Add **Flux Redux** Variation Feature (Optional)

* [x] **Variation Endpoint:** Add an API route (e.g. `/api/variation`) to generate *variations* of a given image. This will use **Flux Redux**, which produces Midjourney-style variations of an input image. First, determine if a Flux Redux model is available on Replicate:

  * Search Replicate's model repository for "flux-redux" (Black Forest Labs). If found, obtain its model name or version ID. If no dedicated model is provided via API, we will implement a workaround.
* [x] **Implement Variation Call:** If Flux Redux is accessible, call it with the current image and (optionally) the last prompt. The API input might be similar to: `{ image: <image_url>, prompt: <original_prompt>, seed: <random> }`. The model will return a new image that is a subtle variation of the input (e.g. slight color or decor changes, but same layout). If Flux Redux is not on Replicate, simulate a variation by re-calling Flux Canny Pro with the original control image but a slightly tweaked prompt or a different random seed.
* [x] **UI Trigger:** Add a "Generate Variation" button (or "Surprise Me Again") in the frontend, enabled when a generated image is on screen. When clicked, call the variation API with the current output image as the input. Show a loading state (since this may take a few seconds like generation).
* [x] **Display Variation Result:** Once the variation API returns, show the new image to the user (replacing or alongside the previous image, depending on UI/UX decisions). The variation should maintain Unoform style and kitchen layout but offer a different take (e.g. alternative color tone or slight design twist).
* [x] **Mark as Optional:** If this feature proves difficult due to model availability, it can be disabled in the UI (or the button shown only in dev mode). Document in code that Flux Redux integration is optional – the system should run without it if needed (e.g. skip the button or have it call a simple seed change variation).

## Guided Kitchen Design UI

* [x] **Replace Theme/Room Inputs with Design Selections:** Remove the generic "Choose your room theme/type" dropdowns and introduce specific kitchen design options. Create UI controls (dropdowns or swatches) for each of the following design aspects, with predefined choices for each:

  * [x] **Cabinet Style:** Dropdown for cabinet design style (e.g. **Modern Flat-Panel**, **Classic Shaker**, **Minimalist Slab**, **Glass-Front Modern**). These describe the cabinet door/profile style.
  * [x] **Cabinet Color/Finish:** Dropdown or color swatch picker for cabinet finish (e.g. **Matte White**, **Natural Oak Wood**, **Black Gloss**, **Walnut Veneer**). Provide a few common colors/finishes.
  * [x] **Countertop Material:** Selection for countertop type (e.g. **White Marble**, **Black Granite**, **Light Oak Butcher Block**, **Concrete**, **Quartz**).
  * [x] **Flooring:** Selection for floor type (e.g. **Hardwood Oak**, **Matte Gray Tile**, **Polished Concrete**, **Herringbone Parquet**).
  * [x] **Wall Paint Color:** Dropdown or swatch for wall paint (e.g. **Bright White**, **Cream**, **Slate Gray**, **Navy Blue**). These are the wall/background colors.
  * [x] **Hardware Finish:** Dropdown for hardware/fixtures finish (e.g. **Brushed Steel**, **Matte Black**, **Polished Brass**, **Chrome** – affects faucets, handles).
* [x] **Dynamic Prompt Generation:** Implement a function on the frontend to construct a natural language prompt from the above selections. For example, if the user chooses Modern Flat-Panel + Matte White cabinets, White Marble countertops, Oak flooring, White walls, and Black hardware, the prompt could be: *"a kitchen with modern flat-panel cabinets painted matte white, white marble countertops, oak wood flooring, white walls, and matte black hardware"*. Always include any overarching style context if relevant (e.g. if "Cabinet Style" implies a general style like modern/traditional, mention it). Ensure the prompt reads fluently and covers all chosen aspects.
* [x] **Connect to Generation API:** Modify the generate function to use this composed prompt. Instead of sending `theme` and `room` separately, send a single `prompt` string to the `/generate` route (adjust the API route handler to accept a prompt directly). The prompt should be passed to Flux Canny Pro as the text input. (If the fine-tuned Unoform model is in use later, the prompt will also include the style token – see Prompt Templating below.)
* [x] **UI Layout & Defaults:** Design the form layout so these selections are easy to use. Group related inputs (perhaps two columns of dropdowns). Provide sensible default values (e.g. Modern style, White cabinets, Marble counters, etc., representing a base Unoform design) so that a user can generate quickly without changing every field. When the page loads or when a new image is uploaded, pre-fill these defaults.
* [x] **Update Labels/Instructions:** Change any UI text guiding the user. For instance, instead of "Choose your room theme", it might say "Select your desired cabinet style and materials". Add a brief description or placeholders for each dropdown if needed (to make it clear what each design aspect means).
* [x] **Testing Prompt Combinations:** Try different combinations of the selections and trigger generation. Verify the returned images reflect the choices. For example, picking "Classic Shaker" cabinets with "Walnut Veneer" should yield a more traditional look, whereas "Modern Flat-Panel" with "Matte Black" yields a sleek contemporary look. Ensure the prompt assembly covers all fields (no missing comma or conjunction). Compare the results to ensure the prompt changes indeed influence the outputs as expected. Refine prompt wording if necessary to improve adherence.

## Undo/Redo History Feature

* [x] **Maintain Image History State:** Augment the frontend state to keep a stack (or list) of images representing the progression of edits. Each time a new image is generated or inpainted, push its URL (and perhaps the prompt used) onto this history stack. The stack's first item can be the original uploaded photo.
* [x] **Add "Undo" Action:** Provide an **Undo** button that becomes enabled when there is at least one previous image in history. Clicking Undo should revert the displayed image to the last one in the stack (pop the top of the stack). In practice, remove the latest image from history and update the UI to show the previous image. Also store the undone image in a temporary buffer for redo.
* [x] **Add "Redo" Action:** Provide a **Redo** button that becomes enabled if an undo was just performed (i.e., if there is an image in the redo buffer). Clicking it will re-apply the last undone change: push the buffered image back onto the history stack and show it. If new actions occur after an undo (e.g. a new variation or inpaint), clear the redo buffer (standard behavior).
* [x] **UI/UX Considerations:** Place the Undo/Redo buttons in the UI (perhaps near the image or in a toolbar). Use familiar icons (e.g. arrow curling left for Undo, right for Redo). Possibly add keyboard shortcuts (Ctrl+Z / Ctrl+Y) for convenience, if easily doable.
* [x] **Test History Navigation:** Go through a full workflow: upload an original kitchen image, generate a design (step 1), maybe apply an inpainting edit (step 2), maybe a variation (step 3). Then click Undo – the image should revert to the step 2 result. Click Undo again – back to step 1 result. Click Redo – should go forward to step 2, etc. Ensure no off-by-one errors in the stack management. The original image should remain accessible (e.g. multiple undos eventually get back to the upload). Fix any bugs like skipping images or failing to clear redo when a new branch is created.

## Scandinavian Design UI & Unoform Branding

* [x] **Update Color Scheme:** Replace the current mixed color palette with a cohesive Scandinavian design system. Use a minimalist palette focused on:
  * [x] Primary: Soft whites and light grays (#FAFAFA, #F5F5F5)
  * [x] Secondary: Warm wood tones and natural beiges (#E8DCC6, #D4C4B0)
  * [x] Accent: Muted blacks and charcoals for contrast (#2C2C2C, #1A1A1A)
  * [x] Interactive: Subtle sage green or dusty blue for CTAs (#A8B5A0 or #9FAEC0)

* [x] **Redesign Button System:** Create a consistent button hierarchy following Scandinavian minimalism:
  * [x] Primary actions: Filled buttons with subtle shadows and hover states
  * [x] Secondary actions: Ghost buttons with thin borders
  * [x] Tertiary actions: Text-only buttons with underline on hover
  * [x] Ensure all buttons have consistent padding, border radius (subtle, 4-8px), and typography

* [x] **Update Typography:** Implement a clean, modern font system:
  * [x] Use a Scandinavian-friendly font like Inter, Helvetica Neue, or custom Unoform font if available
  * [x] Establish clear hierarchy with limited font weights (Regular 400, Medium 500, Semibold 600)
  * [x] Increase white space and line height for better readability

* [x] **Redesign Homepage/Landing:** Create a Unoform-branded experience:
  * [x] Replace generic "dream kitchen" messaging with Unoform-specific copy
  * [x] Add Unoform logo and brand colors
  * [x] Include a hero section showcasing Unoform's signature kitchen style
  * [x] Add brief introduction text about Unoform's Danish design philosophy
  * [x] Update page title and meta descriptions for Unoform

* [x] **Remove GitHub References:** Clean up developer-focused elements:
  * [x] Remove "Star on GitHub" buttons and links
  * [x] Remove any open-source project references
  * [x] Replace footer GitHub links with Unoform-relevant links

* [ ] **Add Social Media Integration:** Enable quick social sharing for Unoform:
  * [ ] Add "Share on Instagram" functionality that formats the image with Unoform branding
  * [ ] Add "Share on Twitter/X" with pre-filled Unoform hashtags and mentions
  * [ ] Include download options optimized for social media dimensions (1:1, 16:9, 9:16)
  * [ ] Add optional Unoform watermark/logo overlay for shared images

* [x] **Update Component Styling:** Apply Scandinavian design principles throughout:
  * [x] Simplify dropdown designs with cleaner borders and subtle shadows
  * [x] Update loading states with minimal, elegant animations
  * [x] Redesign panels and cards with more white space and subtle borders
  * [x] Ensure consistent spacing using an 8px grid system

* [x] **Enhance Visual Feedback:** Improve user experience with subtle interactions:
  * [x] Add smooth transitions for all interactive elements (0.2s ease)
  * [x] Implement subtle hover states that don't distract
  * [x] Use minimal, purposeful animations
  * [x] Ensure proper focus states for accessibility

## Prompt Templating & Unoform Styling

* [ ] **Define Style Token/Suffix:** Establish a consistent way to inject **Unoform's style** into every prompt. For instance, choose a trigger token like `<unoform>` or a phrase like "in the Unoform style". (If a fine-tuned model uses a special token, use that; otherwise a phrase works.) This will ensure the AI outputs align with Unoform's signature design.
* [ ] **Append to Prompts:** Implement logic so that all prompts sent to generation or variation include the style tag. If using the token approach, prepend or append `<unoform>` to the user-generated prompt sentence. If using a phrase, append a clause like "in Unoform's signature style" to the prompt. Do this consistently in the generate and inpaint routes. For example: *"a modern flat-panel kitchen with oak cabinets and black hardware, <unoform>"*.
* [ ] **Avoid Redundancy:** If the user selections or prompt already explicitly mention Unoform (or the token), ensure not to duplicate it. You can handle this by checking if the prompt string already contains the token/phrase, and only append if missing. In general, our UI might not mention Unoform by name (to keep it generic), so adding it in the template covers that.
* [ ] **Test Template Effect:** After appending the Unoform style tag, test a generation to verify it still produces good output. It should bias the results towards Unoform's aesthetics (clean lines, high-end Danish design). If the token `<unoform>` is used on a model not yet fine-tuned, it might have no effect or confuse the model; in that case, consider using a descriptive phrase until the fine-tuned model is ready. Once the fine-tuned model is deployed, the token will activate the learned style. Make sure prompts for inpainting also retain or re-include this token so that edits don't drift in style.

## User Accounts & Image Saving

* [ ] **Implement User Authentication:** Set up a basic authentication system so that only logged-in **Unoform employees** can access certain features (like saving designs). This can be a simple username/password login (e.g. using NextAuth with Credentials provider, or a custom Next.js middleware).

  * [ ] Create a **Login page** with a form for email/username and password. You can seed a few authorized user credentials (for example, an internal list or an environment-based admin password for simplicity).
  * [ ] Upon login, establish a session (JWT or cookie) so the user stays authenticated. Using NextAuth, configure it to store the session and make it accessible (or use Next.js `Middleware` to redirect unauthenticated users).
  * [ ] Protect the main application routes: e.g. require login to access the upload/generation page. If not logged in, redirect to the Login page.
  * [ ] (Optional) If NextAuth is too heavy, a lightweight approach: use basic HTTP auth on Vercel (not straightforward) or a custom API route to verify credentials and set a cookie.
* [ ] **Image Metadata Storage:** Set up a backend datastore to save generated results for each user. You can use the existing Upstash Redis (since it's low-latency and already integrated) to store records, or another database if preferred.

  * [ ] Decide on a data schema. For example, use a Redis hash or sorted set per user: key could be `user:<userid>:images` mapping to a list of saved image entries. An entry should include at least the image URL, a timestamp, and the prompt/design metadata used to create it. Alternatively, store each image as a separate key with a reference to the user.
  * [ ] Create an API route (e.g. `/api/save`) that receives an image URL (and relevant metadata like prompt or selections) and saves it to the datastore for the current authenticated user. Include user identification (e.g. from the session or a token) to namespace the data. Return success/failure.
  * [ ] Integrate a "Save" action on the frontend. For instance, after an image is generated, show a **"Save design"** button (perhaps next to the image). When clicked, call the save API with the image URL and data. You might auto-save the *original upload* as well, or only save generated versions – clarify requirements with stakeholders.
  * [ ] Provide feedback on save: e.g. a toast "Saved!" on success, or an error if something fails.
* [ ] **Saved Designs Gallery:** Create a page or modal where logged-in users can view their saved kitchen designs.

  * [ ] Add a link or button (e.g. in the header nav) for "My Saved Designs". This should route to a new page (e.g. `/saved`) that is protected by auth.
  * [ ] On the Saved Designs page, fetch the saved images list from the database for the current user. Display thumbnails of each saved kitchen image, along with any key info (maybe the date or the main style selections in text).
  * [ ] Allow the user to click on a saved design to view it larger. Optionally, provide actions like download image or regenerate a variation from it (advanced).
  * [ ] Test the full flow: log in, generate a kitchen, save it, then go to Saved Designs and confirm it appears. Also test that each user only sees their own images. Verify data is persistent (e.g. the data remains after page refresh or new login).

## Image Processing Constraints & Documentation

* [ ] **Enforce Image Size Limits:** Ensure uploaded images are resized to a workable resolution (around 1024px) before sending to the AI models. Since the Bytescale Upload widget is used, configure it to apply a max resolution preset. For example, adjust the `transformationPreset: "thumbnail"` to produce ~1024px width images (check Bytescale settings or define a custom preset for this). This guarantees faster processing and model compatibility.
* [ ] **Limit File Size/Type:** Confirm the upload widget is restricting files to reasonable size and type. It's already configured for JPEG/PNG; consider adding a max file size (if supported by Bytescale, e.g. 5MB). If not directly supported, document for users that images should be under a certain size. The goal is to avoid huge uploads that could slow down or crash the generation.
* [ ] **Automatic Image Formatting:** The app should handle format conversions if needed (e.g. if a user somehow uploads a non-JPG, ensure it's converted to JPEG/PNG before sending to Replicate). Bytescale likely handles this by outputting a URL to a standardized format – double-check by testing a PNG upload.
* [ ] **Output Image Dimensions:** Flux models can often output images at the same resolution as input. Document and enforce if necessary that outputs will be, say, 1024x1024 (if the model crops or requires square, though Flux Canny Pro can preserve aspect ratio). If needed, pad or resize input images to a supported aspect (the RoomGPT original likely squared the image or used the provided dimensions).
* [ ] **Update Documentation:** Write a section in the README or an internal doc outlining these constraints: e.g. *"Uploaded images will be downscaled to 1024px for optimization. Maximum upload size ~5MB. Only JPEG/PNG formats are accepted. The generation will preserve original image dimensions up to model limits."* Also mention any safety filters (e.g. "NSFW images are not supported") and the rate limit (5 per day by default). Clearly documenting this helps users (and developers) understand the system limits.
* [ ] **UX Notifications:** Consider adding user-facing warnings or info messages for constraints. For example, if a user tries a huge image, show "Image has been resized to 1024px for processing." If an upload is too large or wrong format, show an error. This will make the tool more robust to various inputs.

## Unoform Style Fine-Tuning Preparation

* [ ] **Gather Unoform Kitchen Images:** Collect a dataset of high-quality images showcasing Unoform kitchens. Aim for at least 50 images (more is better, up to ~100) that cover a variety of kitchen designs but all reflecting Unoform's signature style (e.g. sleek Danish modern cabinetry, specific handles, typical color schemes). Include diversity in lighting conditions, angles, and layouts to make the model robust. Ensure you have the right to use these images for training (copyright cleared or internal assets).
* [ ] **Create Training Dataset:** Organize the images into a folder and create corresponding text captions for each image. Each image file (e.g. `kitchen1.jpg`) should have a caption file (e.g. `kitchen1.txt`) containing a description of that kitchen.
* [ ] **Caption with Trigger Word:** Write detailed captions that not only describe the kitchen (colors, materials, style) but also include a special trigger word to represent **Unoform's style**. For example, decide on using the token `<unoform>` at the start of each caption (or the phrase "Unoform kitchen"). An example caption: "`<unoform> kitchen interior, open-plan design with white matte cabinets, oak wood accents, modern appliances.`" – this teaches the model that whenever the `<unoform>` token is present, those style elements should be expected.
* [ ] **Verify Caption Quality:** Ensure the captions are accurate and emphasize unique Unoform features (e.g. "clean lines, minimalistic design, high-end appliances, etc."). Also include general kitchen descriptors so the model doesn't forget how to render kitchens generically. All captions should include the `<unoform>` token so that it becomes associated with the style across the board. Peer review a few to maintain consistency in format and detail.
* [ ] **Preprocessing:** Resize or crop training images if needed (e.g. to a uniform dimension or aspect ratio consistent with model requirements, often 512x512 or 768x768 for diffusion models). However, since Flux is capable of high-res, we might use higher resolution images if memory allows. Ensure images are in JPEG/PNG format and not too large (to fit GPU memory during training).
* [ ] **Split Dataset (Optional):** If you have enough data, set aside a few images (5-10) as a validation set to periodically evaluate the fine-tune (not strictly necessary but useful to gauge overfitting). These val images should also have captions (with `<unoform>` token) but won't be used in training.

## Unoform Model Fine-Tuning & Deployment

* [ ] **Choose Base Model:** Decide which base model to fine-tune. Since Flux 1.1 Pro (the one used via API) is closed-source, we cannot fine-tune it directly. Instead, use an open FLUX model checkpoint as base. Two likely options are **FLUX 1.0 Dev** and **FLUX 1.0 Schnell**. *Flux-Dev* is larger but non-commercial licensed, whereas *Flux-Schnell* is smaller but Apache 2.0 (commercial-friendly). If Unoform intends to use this fine-tuned model for business, choose **FLUX Schnell** to avoid license issues (Schnell is faster and allowed in production).
* [ ] **Set Up Training Environment:** Prepare a GPU environment for fine-tuning. This could be a Jupyter notebook or script using Hugging Face Diffusers library, or a custom training job using Replicate's Cog system. Ensure you have the FLUX base model weights accessible. For HuggingFace: you might load `black-forest-labs/FLUX-1-Dev` or `.../FLUX-1-Schnell` from the Hub as your model.
* [ ] **Training Method:** Use a fine-tuning approach suitable for adding a new style. One approach is **DreamBooth** (treating "Unoform style" as a new concept to learn). Another is fine-tuning the entire model on our dataset (if large enough) with lower learning rate. DreamBooth might be simpler: it usually requires a class word (like "kitchen") and the style token. Since this is a style (not a single object/person), you might not need regularization images for a class, or could use a few generic kitchen images as regularization to prevent overfitting.
* [ ] **Run Fine-Tuning:** Execute the training process on the dataset. Monitor the loss and, if possible, generate sample images every few epochs to see if the `<unoform>` token indeed yields the Unoform look. Training might take a few hours depending on model and GPU. Aim to find a point where the model has learned the style but not overfitted (the generated images should look like *new* Unoform kitchens, not just recreations of training images).
* [ ] **Evaluate Model:** After training, test the model by generating images with prompts that include the `<unoform>` token (e.g. "`<unoform> kitchen with matte black cabinets and white marble countertop`"). Check that the outputs consistently reflect Unoform's design language (compare them with actual Unoform catalog images for validation). Make sure general coherence and quality are maintained.
* [ ] **Deploy Fine-Tuned Model to Replicate:** Package the fine-tuned model for inference. If using Replicate, you can create a custom model endpoint:

  * [ ] Use Replicate's **Cog** tool to containerize the model. Write a `cog.yaml` and a `predict.py` that loads the fine-tuned weights and performs inference given a prompt (and optional control image if we fine-tuned a control version). Alternatively, if the fine-tuned model is purely text-to-image (no control), you might integrate it in a two-step pipeline (generate image with fine-tuned model, then use original image + that output in Flux Canny Pro if needed – though ideally we fine-tune a control-net variant).
  * [ ] Push the model to Replicate as a private model. This will give you a new model name (likely something like `your-organization/flux-unoform:latest`). Note the model version ID after uploading.
  * [ ] Update the application's generation endpoints to use this new model. For example, change the Flux Canny Pro model ID to the fine-tuned model's ID for the structured generation step. Do similarly for inpainting if you fine-tuned an inpainting model or if you keep using base Fill Pro.
  * [ ] Test the end-to-end flow now using the fine-tuned model via Replicate. Ensure that the `prompt` including `<unoform>` now produces results that are unmistakably in Unoform style, even with challenging prompts. If something fails (e.g. model not loading on Replicate), debug the deployment (check logs, memory, etc.) or adjust the Cog config.
* [ ] **License Documentation:** Clearly document the licensing of the fine-tuned model. Since we chose FLUX Schnell (Apache 2.0), note that the fine-tuned model can be used commercially. If any part of the pipeline still uses a non-commercial component (e.g. if we temporarily use Flux Dev for a test), call that out and replace it before production. In the repository README or documentation, include a note that *"The Unoform fine-tuned model is based on FLUX Schnell (Apache 2.0), fine-tuned on Unoform's proprietary images."*.
* [ ] **Final Integration Testing:** Do a complete run-through of the application with the fine-tuned model in place. Upload a kitchen image, select design options, generate the redesign, use inpainting, variation, etc. Verify that the results are improved by the fine-tune (more aligned with Unoform style than before). Collect a few example outputs for internal demo. If all looks good, the GenAI Kitchen application is fully implemented and ready for use!

## Implementation Notes and Status

We have successfully implemented:

1. **Codebase Cleanup & Setup**: Upgraded dependencies, removed legacy code, simplified the app to focus on kitchens, updated branding, and removed obsolete model references.

2. **Deployment on Vercel**: Set up the Vercel project, configured environment variables, set up Upstash Redis for rate limiting, updated model versions, enhanced error handling, created deployment tests, optimized configuration, and deployed to Vercel.

3. **Flux Canny Pro Integration**: Replaced Stable Diffusion API calls with Flux Canny Pro, updated the UI, and tested the generation flow.

4. **Flux Fill Pro Inpainting Feature**: Created a new inpainting API route, implemented a mask drawing canvas component, and integrated the functionality into the UI.

5. **Flux Redux Variation Feature**: Added a variation endpoint, implemented variation calls, and added UI controls for generating variations.

6. **Testing Utilities**: Created comprehensive test scripts to validate the environment, API endpoints, and deployment configuration.

7. **Guided Kitchen Design UI**: Implemented a comprehensive kitchen design interface with six specific design selections (cabinet style, cabinet finish, countertop material, flooring type, wall color, and hardware finish). Each selection has predefined options representing common kitchen design choices. The UI uses a grid layout for better organization and includes a dynamic prompt generation function that creates natural language descriptions from the selections.

8. **Undo/Redo History Feature**: Implemented a complete image history management system with undo/redo functionality. Created a custom React hook (useImageHistory) that maintains a history stack of all image operations including original uploads, generated designs, inpainted edits, and variations. Added undo/redo buttons to the UI with proper disabled states and keyboard shortcuts (Ctrl/Cmd+Z for undo, Ctrl/Cmd+Y for redo). The history resets when starting a new kitchen generation.

9. **Scandinavian Design UI & Unoform Branding**: Fully implemented a modern, cohesive Scandinavian design system:
   - Created a comprehensive modern design system using OKLCH color space for better color consistency
   - Implemented shadcn/ui-inspired component styling with proper semantic color tokens
   - Updated all buttons with modern styling (btn-default, btn-secondary, btn-outline, btn-destructive)
   - Fixed all text visibility issues by replacing hard-coded colors with semantic tokens
   - Created modern inpaint UI component with card-based layout and better UX
   - Implemented card-based layouts for image displays with proper shadows and borders
   - Enhanced loading states with elegant animated dots instead of button-based loading
   - Applied consistent hover effects (hover-lift, hover-scale) and smooth transitions
   - Updated dropdown designs with modern styling and better accessibility
   - Replaced GitHub references with Unoform branding throughout
   - Implemented gradient text effects and modern visual hierarchy

10. **Modern UI Implementation (Latest Update)**: Completed comprehensive UI modernization:
    - **Modern Design System**: Created OKLCH-based color system without @apply directives to avoid compilation issues
    - **Button System Overhaul**: All buttons now use consistent modern classes with proper hover states and animations
    - **Enhanced Inpaint UI**: Created ModernInpaintUI component with card-based layout, clear instructions, and better UX
    - **Visual Consistency**: Applied modern design patterns throughout with proper shadows, borders, and spacing
    - **Loading State Improvements**: Replaced button-based loading with elegant animated dots and descriptive text
    - **Accessibility Enhancements**: Improved focus states, color contrast, and keyboard navigation
    - **Performance Optimizations**: Removed problematic CSS patterns and optimized for faster builds
    - **Code Quality**: Fixed all TypeScript errors, JSX structure issues, and removed unused imports

**Current Status**: 
- ✅ **Development Environment**: All features working locally with modern UI
- ✅ **Build System**: No compilation errors, ready for production deployment
- ✅ **API Integration**: Updated model versions and error handling implemented
- ✅ **UI/UX**: Professional, modern interface suitable for Unoform brand
- 🔄 **Vercel Deployment**: Ready for updated build deployment

**Deployment Readiness**: The application is fully ready for Vercel deployment with:
- Updated API routes with latest Flux model versions and better error handling
- Modern design system that compiles without issues
- Comprehensive test scripts for environment validation
- Optimized next.config.js and vercel.json configurations
- Professional UI that matches contemporary design standards

The application now features a complete, modern implementation ready for production use with Unoform branding.
