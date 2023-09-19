import { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/sessions";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("info"), session.get("path");
}

const Info = () => {
  // Get data from session storage or loader if there is no data
  let info,
    path = useLoaderData();

  console.log(info);

  return (
    <div className="mt-16 text-base text-justify whitespace-pre-wrap mx-80 ">
      {/* If data isn't null */}
      {/* {Object.keys(infoData).length ? (
        <div>
          {infoData.map((item) => (
            <div>
              <div className="flex justify-center mb-8">
                <div className="flex items-center bg-gray-200 rounded-lg">
                  <div className="flex items-center px-2 py-2">
                    <h1 className="italic font-semibold text-center">
                      {item.path}
                    </h1>
                  </div>
                </div>
              </div>
              <p>{item.info}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center">Loading...</p>
      )} */}
    </div>
  );
};

export default Info;
