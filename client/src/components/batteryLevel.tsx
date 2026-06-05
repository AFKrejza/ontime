// @ts-ignore
import MediumBattery from "../assets/medium-battery.png";
// @ts-ignore
import LowBattery from "../assets/low-battery.png";

const iconStyle = {
  objectFit: "contain" as const,
};

export default function getBatteryIcon(
  level: number,
  width: number,
  height: number,
) {
  if (level >= 75) {
    return <span>🔋</span>;
  } else if (level > 40) {
    return (
      <img
        src={MediumBattery}
        alt="Medium Battery"
        style={iconStyle}
        width={width}
        height={height}
      />
    );
  } else {
    return (
      <img
        src={LowBattery}
        alt="Low Battery"
        style={iconStyle}
        width={width}
        height={height}
      />
    );
  }
}
