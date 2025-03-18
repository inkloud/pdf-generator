# PDF Generator

PDF generator using React-PDF

## Docker

```bash
docker build -t pdf-report --build-arg USER_ID=`id -u` --build-arg GROUP_ID=`id -g` .
docker run --rm -it -p 8000:3000 pdf-report
```