import { LoaderFunction } from '@remix-run/node';
import { Outlet, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { json } from 'remix-utils';
import { getLocale } from '~/utils/utils';

export function CatchBoundary() {
  let error = useRouteError();
  let data = 'Unknown Error';
  if (isRouteErrorResponse(error)) {
    data = error.data;
  } else if (error instanceof Error) {
    data = error.message;
  }
  return <div className="text-2xl">{data}</div>;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  let lng = getLocale(request);
  if (!lng) {
    throw new Response('Page not found', {
      status: 404,
      statusText: 'Not Found',
    });
  }
  return json({});
};

export default function Language() {
  return <Outlet />;
}
