import { useEffect } from "react";

const TestThrowingError = ({ throwError }) => {
  useEffect(() => {
    if (throwError) throw new Error();
  }, []);

  return (
    <div style={{ border: "1px solid red" }}>
      <h1>Hello World</h1>
    </div>
  );
};

export default TestThrowingError;
