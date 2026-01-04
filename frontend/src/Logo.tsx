import React from "react";

type Props = {
  size?: number;
  className?: string;
};

const Logo: React.FC<Props> = ({ size = 48, className }) => {
  const candidates = React.useMemo(() => {
    // Prefer encoded first to avoid initial 404 when spaces are in filenames
    return [
      "/Adobe%20Express%20-%20file.png",
      "/Adobe Express - file.png",
      "/ascend-logo.png",
      "/logo.png",
    ];
  }, []);

  const [idx, setIdx] = React.useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)];

  const handleError = () => {
    if (idx < candidates.length - 1) setIdx((i) => i + 1);
  };

  return (
    <img
      src={src}
      onError={handleError}
      alt="Ascend logo"
      width={size}
      height={size}
      className={(className ? className + " " : "") + "inline-block rounded-xl object-cover"}
    />
  );
};

export default Logo;
