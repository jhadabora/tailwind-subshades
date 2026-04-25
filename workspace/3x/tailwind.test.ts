import tests from '../v3-test'
import pkg from 'tailwindcss/package.json';
import tailwindcss from "tailwindcss";

tests(tailwindcss, pkg.version)