import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import React from "react";

export function useRouter() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const query = {
    ...params,
    ...Object.fromEntries(searchParams.entries()),
  };

  return {
    query,
    push: navigate,
    replace: (url: string) => navigate(url, { replace: true }),
    pathname: location.pathname,
  };
}

export function dynamic(importFn: () => Promise<any>, options: any) {
  return React.lazy(importFn);
}

export const Image = (props: any) => {
  const { src, alt, ...rest } = props;
  return <img src={src?.src || src} alt={alt} {...rest} />;
};
