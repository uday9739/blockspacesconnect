export const SendConfirmation = ({ message, width, height, fontSize, marginBottom }) => {
  return (
    <>
      <svg version="1.1" width={500} height={500} style={{ width: width, height: height, marginTop: 125, margin: "40px auto 0" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
        <circle className="path circle" strokeDasharray={1000} strokeDashoffset={0} fill="none" stroke="#50c878" strokeWidth="6" strokeMiterlimit="10" cx="65.1" cy="65.1" r="62.1" />
        <polyline
          className="path check"
          strokeDasharray={1000}
          strokeDashoffset={0}
          fill="none"
          stroke="#50c878"
          strokeWidth="6"
          strokeLinecap="round"
          strokeMiterlimit="10"
          points="100.2,40.2 51.5,88.8 29.8,67.5 "
        />
      </svg>
      <p style={{ textAlign: "center", marginBottom: marginBottom, fontSize: fontSize }}>{message}</p>
    </>
  );
};