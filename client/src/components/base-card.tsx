import { BriefcaseIcon, GraduationCapIcon, HeartIcon, MapPinIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export function BaseCard () {
    return (
        <Card className="overflow-hidden">
              <img
                src={`/placeholder.svg?height=200&width=300`}
                alt="Profile"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">John Doe, 28</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPinIcon className="mr-2 h-4 w-4" />
                  New York, NY
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <BriefcaseIcon className="mr-2 h-4 w-4" />
                  Software Engineer
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <GraduationCapIcon className="mr-2 h-4 w-4" />
                  Bachelor's in Computer Science
                </div>
                <Button className="w-full">
                  <HeartIcon className="mr-2 h-4 w-4" /> Connect
                </Button>
              </CardContent>
            </Card>
            )
}
