module.exports = {
	"src/**/*.{ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"],
	"src/**/*.scss": ["stylelint --fix --max-warnings=0"],
	"**/*.ts?(x)": () => "tsc --noEmit",
};
