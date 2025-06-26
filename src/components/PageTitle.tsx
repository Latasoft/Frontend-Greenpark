import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
  useEffect(() => {
    document.title = `${title} | GreenPark`;
  }, [title]);

  return null;
};

export default PageTitle;
