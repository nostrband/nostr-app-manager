import React, { useEffect, useState } from 'react';

const GitHubIconWithStar = ({ link }) => {
  const [imageUrl, setImageUrl] = useState();

  const isValidGitHubRepoLink = (link) => {
    return /^https?:\/\/github\.com\/([\w-]+)\/([\w-]+)$/i.test(link);
  };

  const getRepoStarByLink = async () => {
    try {
      const matchResult = link.match(/github\.com\/([\w-]+)\/([\w-]+)/);
      if (!matchResult) {
        throw new Error('Invalid GitHub repository URL');
      }
      const repoOwner = matchResult[1];
      const repoName = matchResult[2];
      const apiUrl = `https://img.shields.io/github/stars/${repoOwner}/${repoName}?style=social`;
      return setImageUrl(apiUrl);
    } catch (error) {
      console.error('Ошибка при получении ссылки на иконку звездочек:', error);
      return null;
    }
  };

  useEffect(() => {
    getRepoStarByLink();
  }, []);

  if (!imageUrl) {
    return isValidGitHubRepoLink(link) ? <div>Загрузка...</div> : null;
  }

  return <img className="github-icon" src={imageUrl} alt="Link to Github" />;
};

export default GitHubIconWithStar;
