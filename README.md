# DeepSight - Image Analysis Web Application

This project is a front-end application that allows users to upload images and run them through a pre-trained deep learning model to detect objects in the image. The application is built using Next.js, a React framework, and Django, a Python web framework.

## Instructions
```console
git clone https://github.com/ItsSpirax/DeepSight
cd DeepSight
```

Set up PostgreSQL password:

```console
nano docker-compose.yml
```

Configure environment variables:

```console
cp .env.example .env
nano .env
```

Start the application:

```console
docker compose up -d
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.