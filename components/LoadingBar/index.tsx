import React from 'react';
import { useNProgress } from '@tanem/react-nprogress';
import Bar from './Bar';
import Container from './Container';

const ProgressBar: React.FC<{ isAnimating: boolean }> = ({ isAnimating }) => {
    const { animationDuration, isFinished, progress } = useNProgress({
        isAnimating,
    });

    return (
        <Container
            animationDuration={animationDuration}
            isFinished={isFinished}
        >
            <Bar animationDuration={animationDuration} progress={progress} />
        </Container>
    );
};

export default ProgressBar;
