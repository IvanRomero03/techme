import { Button } from "t/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "t/components/ui/navigation-menu";
import { NavigationMenuDemo } from "./Hold";

export default function TopNavBar() {
  return (
    <>
      <div className="f border-b">
        <div className="flex h-16 items-center px-4">
          <Button>Hola</Button>
          <NavigationMenuDemo />
        </div>
      </div>
    </>
  );
}
