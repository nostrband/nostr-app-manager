import React from 'react';
import './ReviewAnswers.scss';
import ArrowIcon from '../../../icons/Arrow';
import Profile from '../../../elements/Profile';
import * as cmn from '../../../common';

const ReviewAnswers = ({ answers, setShowAnswersById, showAnswers }) => {
  return (
    <div>
      {answers.length > 0 ? (
        <button onClick={setShowAnswersById} className="open-comment-button">
          <span>
            {showAnswers
              ? `Hide answers(${answers.length})`
              : `See answers(${answers.length})`}
          </span>
          <ArrowIcon className={`arrow${showAnswers ? 'reverse' : ''}`} />
        </button>
      ) : null}

      <div>
        {showAnswers ? (
          <ul className={`container-answers ${showAnswers ? 'open' : 'close'}`}>
            {answers.map((a) => {
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
