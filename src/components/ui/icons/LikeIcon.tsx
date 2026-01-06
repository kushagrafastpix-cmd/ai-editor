// EditorToolPanel/Common/Icons/LikeIcon.tsx

import type { SVGProps } from "react";

const LikeIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}   // ✅ this is the key
    >
      <path
        d="M3.5026 12.2507V5.83398M0.585938 7.00065V11.084C0.585938 11.7283 1.10827 12.2507 1.7526 12.2507H9.58458C10.4483 12.2507 11.1829 11.6205 11.3142 10.7668L11.9424 6.68342C12.1055 5.62334 11.2853 4.66732 10.2128 4.66732H8.16927C7.84711 4.66732 7.58594 4.40615 7.58594 4.08398V2.02239C7.58594 1.22798 6.94194 0.583984 6.14753 0.583984C5.95805 0.583984 5.78634 0.695573 5.70939 0.868723L3.65657 5.48757C3.56294 5.69822 3.35404 5.83398 3.12351 5.83398H1.7526C1.10827 5.83398 0.585938 6.35632 0.585938 7.00065Z"
        stroke="currentColor"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LikeIcon;
