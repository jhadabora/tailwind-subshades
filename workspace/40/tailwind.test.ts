import tests from '../v4-test'
import pkg from 'tailwindcss/package.json';
import tailwindpost from "@tailwindcss/postcss";
import postcss from "postcss";

const pcss = postcss([tailwindpost({})])
tests(pcss, pkg.version)