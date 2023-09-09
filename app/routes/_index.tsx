import { Tabs } from "@radix-ui/react-tabs";
import type { V2_MetaFunction } from "@remix-run/node";
import TabsRica from "./tabs/tabs";
import LoadButton from "./tabs/loadButton";
import React from "react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  // Set default values for the states
  const [componentData, setComponentData] = React.useState<any>([]);
  const [componentFigures, setComponentFigures] = React.useState<any>([]);
  const [carpetFigures, setCarpetFigures] = React.useState<any>([]);
  const [info, setInfo] = React.useState<any>([]);
  const [showIntroPopup, setShowIntroPopup] = React.useState<boolean>(true);
  const [showAboutPopup, setShowAboutPopup] = React.useState<boolean>(false);
  const [showTabs, setShowTabs] = React.useState<boolean>(false);
  const [originalData, setOriginalData] = React.useState<any>([]);
  const [dataRead, setDataRead] = React.useState<boolean>(false);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex flex-col h-[100%]">
        <TabsRica />
        <LoadButton />
      </div>
    </div>
  );
}
