const Spinner = () => {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <svg
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transformOrigin: "center",
          animation: "spin 2s linear infinite",
        }}
      >
        <circle
          cx="400"
          cy="400"
          fill="none"
          r="200"
          strokeWidth="50"
          stroke="#000000"
          strokeDasharray="847 1400"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
};

export default Spinner;
