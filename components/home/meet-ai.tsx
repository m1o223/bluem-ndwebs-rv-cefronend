import AnimatedStory from "./animated-story";
import { meetAiCopy } from "./meet-ai-copy";

export default function MeetAi() {
  return <AnimatedStory id="home-meet-ai" titleId="home-ai-title" content={meetAiCopy} href="/ask-ai" />;
}
