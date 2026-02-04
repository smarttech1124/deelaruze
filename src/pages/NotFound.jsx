import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-black mb-4">404</h1>
        <h2 className="text-4xl font-black mb-6">PAGE NOT FOUND</h2>
        <p className="text-xl text-gray-400 mb-8">
          This wall is blank. Nothing here but empty space.
        </p>
        <Link to="/">
          <Button size="lg">BACK TO HOME</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;