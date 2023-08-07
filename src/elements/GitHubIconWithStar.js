import React, { useEffect, useState } from 'react';

const GitHubIconWithStar = ({ link }) => {
  const [imageUrl, setImageUrl] = useState();

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
      return null;
    }
  };

  useEffect(() => {
    getRepoStarByLink();
  }, []);

  return <img src={imageUrl} />;
};

export default GitHubIconWithStar;
