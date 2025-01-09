import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

export default function CustomMapDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Info className="w-4 h-4" />
          <span>How to Create Custom Maps</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">Creating Custom NEAR Ecosystem Maps</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-white/80">
          <p>
            You can create and share custom views of the NEAR ecosystem by following these steps:
          </p>
          
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">1. Filter Categories</h3>
            <p>
              Use the category toggles to show/hide specific categories. Click on category names to toggle their visibility.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">2. Featured Categories</h3>
            <p>
              Toggle "Featured Only" to focus on the most important categories. This helps create a more focused view of the ecosystem.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">3. Project Status</h3>
            <p>
              Use the "Show Inactive" toggle to include or exclude inactive projects from your custom view.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">4. Share Your View</h3>
            <p>
              Click the "Share" button to open the share dialog. Here you can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Preview your custom view</li>
              <li>Download the view as an image</li>
              <li>Share directly on Twitter or other social media</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Example Use Cases</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create a DeFi-focused view by selecting only DeFi-related categories</li>
              <li>Generate a snapshot of active gaming projects</li>
              <li>Create an infrastructure-focused map for developers</li>
              <li>Make a comprehensive view of the NFT ecosystem</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Sharing Options</h3>
            <p>
              After customizing your view, you can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Download it as an image to share anywhere</li>
              <li>Share it directly on social media</li>
              <li>Copy the preview to your clipboard</li>
            </ul>
            <p className="text-sm bg-primary/10 p-3 rounded-lg mt-2">
              <span className="font-semibold text-white">🔗 Tip:</span> The preview image is perfect for sharing on Twitter, Discord, or other social platforms.
            </p>
          </div>

          <p className="italic pb-2">
            Create your perfect view of the NEAR ecosystem and share it with the community!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 