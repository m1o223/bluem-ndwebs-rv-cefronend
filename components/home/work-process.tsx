import AnimatedStory from "./animated-story";
import { workProcessCopy } from "./work-process-copy";

export default function WorkProcess() {
  return <AnimatedStory id="home-how-we-work" titleId="home-work-title" content={workProcessCopy} href="/quote" />;
}
