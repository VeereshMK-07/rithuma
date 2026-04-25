import Button from "../ui/Button";

function QuestionCard({
  question,
  description,
  options,
  onSelect,
  onBack,
  step,
  total
}) {
  return (
    <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl p-6 shadow-sm transition-all duration-300">
      
      {/* Progress */}
      <p className="text-sm text-gray-400 mb-3">
        Step {step} of {total}
      </p>

      <h2 className="text-xl font-semibold text-lavender mb-2">
        {question}
      </h2>

      <p className="text-gray-600 mb-6 text-sm">
        {description}
      </p>

      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <Button
            key={option}
            variant="secondary"
            onClick={() => onSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 text-sm text-gray-400 underline"
        >
          Back
        </button>
      )}
    </div>
  );
}

export default QuestionCard;
