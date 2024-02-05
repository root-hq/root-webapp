import Image from "next/image";
import React from "react";

const Logo = () => {
  return (
    <Image
      src="/images/root-logo.png"
      alt="Logo"
      style={{
        width: "22%",
        height: "auto",
        maxWidth: "200px",
      }}
    />
  );
};

export default Logo;
