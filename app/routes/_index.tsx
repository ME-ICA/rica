import type { ActionArgs, V2_MetaFunction } from "@remix-run/node";
import TabsRica from "./tabs";
import LoadButton from "./loadButton";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "../sessions";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Rica" },
    { name: "description", content: "Reports for ICA" },
  ];
};

// export async function loader() {
//   return [
//     {
//       info: "This is an example of a tabbed interface.",
//       path: "/User/rica/data/tedana/results",
//     },
//   ];
// }

export default function Index() {
  let data = useLoaderData();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div className="flex flex-col h-[100%]">
        <TabsRica data={data} />
        <LoadButton />
      </div>
    </div>
  );
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("info", "This is an example of a tabbed interface.");
  session.set("path", "/User/rica/data/tedana/results");
  // etc.
}
