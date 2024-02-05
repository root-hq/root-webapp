import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <Image
      src="/images/root-logo.png"
      alt="Logo"
      width={42}
      height={42}
      style={{
        height: "auto",
        maxWidth: "200px",
      }}
    />
  );
};

export default Logo;
