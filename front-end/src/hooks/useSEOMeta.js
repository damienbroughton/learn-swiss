export default function useSEOMeta(options) {
  const {
    title,
    description,
    canonicalUrl,
    schema,
    keywords = '',
    robotsDirective = 'index, follow',
    siteImage = 'https://www.learn-swiss.ch/og-image.png'
  } = options;

  return {
    title,
    description,
    robotsDirective,
    keywords,
    canonicalUrl,
    siteImage,
    schema
  };
}
