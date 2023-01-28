
prod:
	npm run build
	APP_API_URL=https://scriptcat.org/api/v2 APP_API_PROXY=https://scriptcat.org/api/v2 APP_BBS_OAUTH_CLIENT=80mfto0y3b8v npm run start


docker:
	docker build -t scriptcat-list-frontend -f deploy/docker/Dockerfile .
