import { useState } from "react";
import QuestionCard from "./QuestionCard";
import { writeData } from "../../utils/storageService";
import { useUser } from "../../context/UserContext";

const questions = [
  {
    id: 1,
    question: "How regular is your menstrual cycle?",
    description: "This helps us understand your cycle rhythm.",
    options: ["Very Regular", "Sometimes Irregular", "Highly Irregular"],
  },
  {
    id: 2,
    question: "Average cycle length?",
    description: "From first day of period to next period.",
    options: ["21–25 days", "26–30 days", "31–35 days", "Not sure"],
  },
  {
    id: 3,
    question: "Do you experience severe pain?",
    description: "Pain level helps us give better guidance.",
    options: ["No", "Mild", "Moderate", "Severe"],
  },
];

function Onboarding({ onComplete }) {
  const { user, userType } = useUser();

  
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleSelect = (answer) => {
    const current = questions[step];

    const updated = {
      ...answers,
      [current.id]: answer,
    };

    setAnswers(updated);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // 🔐 Centralized + encrypted write
      writeData("rithuma_onboarding", updated, {
        userId: user?.uid || "guest",
        userType,
      });
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <QuestionCard
      question={questions[step].question}
      description={questions[step].description}
      options={questions[step].options}
      onSelect={handleSelect}
      onBack={step > 0 ? handleBack : null}
      step={step + 1}
      total={questions.length}
    />
  );
}

export default Onboarding;
