import React from 'react';
import { useParams } from 'react-router-dom';

const IndividualNFTAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="bg-white dark:bg-gray-800 p-4"> {id ? ( <>
         <h1 className="text-black dark:text-white">Analisis de NFT #{id}</h1>
      <p>Detalles del NFT individual en construccion...</p>
      </>
    ) : (
      <p className="text-red-500">Error: No se proporcionó un ID de NFT.</p>
    )}
    </div>
  );
};

export default IndividualNFTAnalysis;