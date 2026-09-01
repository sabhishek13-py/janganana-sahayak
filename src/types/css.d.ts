/**
 * Next.js compiles global stylesheets itself, but `tsc --noEmit` needs a
 * declaration for the side-effect import in the root layout.
 */
declare module '*.css';
