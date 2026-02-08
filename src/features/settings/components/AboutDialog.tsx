import { Info, Mail, FileText, Github, ExternalLink } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AboutDialogProps {
    readonly trigger?: React.ReactNode;
}

export const AboutDialog = ({ trigger }: AboutDialogProps) => {
    const version = "1.0.0";
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
                        About RestHelper
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">RestHelper</DialogTitle>
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
                            RestHelper is a comprehensive restaurant management system designed
                            to streamline operations including recipe costing, inventory
                            tracking, prep sheet management, and multi-currency support. Built
                            with modern technologies to help restaurant professionals manage
                            their business efficiently.
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
                                <span>Comprehensive ingredient and inventory management</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Multi-currency support with real-time conversion</span>
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
                                href="mailto:support@resthelper.com"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <Mail className="h-4 w-4" />
                                <span>support@resthelper.com</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <a
                                href="https://docs.resthelper.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Documentation</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                            <a
                                href="https://github.com/resthelper/app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <Github className="h-4 w-4" />
                                <span>GitHub Repository</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>

                    <Separator />

                    {/* Legal */}
                    <div className="space-y-3">
                        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                        // TODO: Open license dialog or page
                                        globalThis.alert("License information would be displayed here");
                                    }}
                                >
                                    License
                                </Button>
                                <span>•</span>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                        // TODO: Open privacy policy dialog or page
                                        globalThis.alert("Privacy policy would be displayed here");
                                    }}
                                >
                                    Privacy Policy
                                </Button>
                                <span>•</span>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                        // TODO: Open terms of service dialog or page
                                        globalThis.alert("Terms of service would be displayed here");
                                    }}
                                >
                                    Terms of Service
                                </Button>
                            </div>
                            <p className="text-center pt-2">
                                © {new Date().getFullYear()} RestHelper. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
