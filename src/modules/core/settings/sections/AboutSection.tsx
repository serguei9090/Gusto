import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AboutDialog } from "../components/AboutDialog";

export const AboutSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About RestHelper</CardTitle>
        <CardDescription>
          View application information, version details, and support resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AboutDialog />
      </CardContent>
    </Card>
  );
};
