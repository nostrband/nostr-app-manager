const AnswerIcon = ({ props, onClick }) => {
  return (
    <svg
      onClick={onClick}
      className="pointer"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 6H19V14C19 14.55 18.55 15 18 15H6V16C6 17.1 6.9 18 8 18H18L22 22V8C22 6.9 21.1 6 20 6ZM17 11V4C17 2.9 16.1 2 15 2H4C2.9 2 2 2.9 2 4V17L6 13H15C16.1 13 17 12.1 17 11Z"
        fill="#FFC700"
      />
    </svg>
  );
};

export default AnswerIcon;
