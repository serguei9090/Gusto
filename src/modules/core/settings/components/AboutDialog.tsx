import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ExternalLink, FileText, Info, Mail } from "lucide-react";
import logo from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/useMobile";
import { useMobileComponent } from "@/lib/mobile-registry";

interface AboutDialogProps {
  readonly trigger?: React.ReactNode;
}

export const AboutDialog = ({ trigger }: AboutDialogProps) => {
  const isMobile = useMobile();
  const MobileComponent = useMobileComponent("MobileAbout");
  const version = __APP_VERSION__;
  const buildDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Info className="mr-2 h-4 w-4" />
            About Gusto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={`${isMobile ? "w-full max-w-full rounded-none border-x-0 p-4 pt-6 top-16 translate-y-0 h-[calc(100dvh-4rem)]" : "sm:max-w-[600px]"} max-h-[90vh] overflow-y-auto`}
      >
        {isMobile && MobileComponent ? (
          <MobileComponent version={version} buildDate={buildDate} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <img
                  src={logo}
                  alt="Gusto Logo"
                  className="w-8 h-8 object-contain"
                />
                <span>Gusto</span>
              </DialogTitle>
              <DialogDescription>
                Professional Restaurant Management System
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Version Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Version Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-mono font-medium">{version}</span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-muted-foreground">Build Date</span>
                    <span className="font-mono font-medium">{buildDate}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* About Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">About</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gusto is a comprehensive restaurant management system designed
                  to streamline operations including recipe costing, inventory
                  tracking, prep sheet management, and multi-currency support.
                  Built with modern technologies to help restaurant
                  professionals manage their business efficiently.
                </p>
              </div>

              <Separator />

              {/* Key Features */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Key Features
                </h3>
                <ul className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Recipe costing and profit margin analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Comprehensive ingredient and inventory management
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>
                      Multi-currency support with real-time conversion
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Prep sheet generation and management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Supplier directory and cost tracking</span>
                  </li>
                </ul>
              </div>

              <Separator />

              {/* Support & Resources */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Support & Resources
                </h3>
                <div className="space-y-2">
                  <a
                    href="mailto:serguei246@gmail.com"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Mail className="h-4 w-4" />
                    <span>serguei246@gmail.com</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    href="https://docs.gusto.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documentation</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <a
                    href="https://github.com/serguei9090/Gusto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <GitHubLogoIcon className="h-4 w-4" />
                    <span>GitHub Repository</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              </div>

              <Separator />

              {/* Legal */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <p className="text-center font-medium">
                    Licensed for Personal Use & Small Business
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() =>
                        window.open(
                          "https://github.com/serguei9090/Gusto/blob/main/LICENSE.md",
                          "_blank",
                        )
                      }
                    >
                      License Details
                    </Button>
                    <span>•</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() =>
                        window.open(
                          "https://github.com/serguei9090/Gusto/blob/main/PRIVACY_POLICY.md",
                          "_blank",
                        )
                      }
                    >
                      Privacy Policy
                    </Button>
                    <span>•</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() =>
                        window.open(
                          "https://github.com/serguei9090/Gusto/blob/main/TERMS_OF_SERVICE.md",
                          "_blank",
                        )
                      }
                    >
                      Terms of Service
                    </Button>
                  </div>
                  <p className="text-center pt-2">
                    © {new Date().getFullYear()} Gusto. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
