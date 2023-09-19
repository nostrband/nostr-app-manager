import React from 'react';
import './ReviewAnswers.scss';
import ArrowIcon from '../../../icons/Arrow';
import Profile from '../../../elements/Profile';
import * as cmn from '../../../common';

const ReviewAnswers = ({ answers, setShowAnswersById, showAnswers }) => {
  const sortedAnswers = answers.slice().sort((a, b) => {
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return (
    <div>
      {answers.length > 0 ? (
        <button onClick={setShowAnswersById} className="open-comment-button">
          <span>
            {showAnswers
              ? `Hide replies (${answers.length})`
              : `Show replies (${answers.length})`}
          </span>
          <ArrowIcon className={`arrow${showAnswers ? 'reverse' : ''}`} />
        </button>
      ) : null}

      <div>
        {sortedAnswers ? (
          <ul className={`container-answers ${showAnswers ? 'open' : 'close'}`}>
            {sortedAnswers.map((a) => {
              let authorAnswer = a.answerAuthor?.content
                ? cmn.convertContentToProfile([a.answerAuthor])
                : {};
              return (
                <li className="answer-item darked" key={a.id}>
                  <Profile
                    small
                    profile={{ profile: authorAnswer }}
                    pubkey={a.pubkey}
                  />
                  <span> : </span>
                  {a.content}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
};

export default ReviewAnswers;
