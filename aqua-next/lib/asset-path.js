// GitHub project sites serve assets beneath the repository name.
export function assetPath(path) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
}
