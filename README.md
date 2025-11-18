# PDF Generator

PDF generator using React-PDF

[DockerHub](https://hub.docker.com/repository/docker/bacchilu/pdf-generator)

## Docker

```bash
docker build -t bacchilu/pdf-generator -t bacchilu/pdf-generator:4.1.1 --build-arg USER_ID=`id -u` --build-arg GROUP_ID=`id -g` .
docker push bacchilu/pdf-generator
docker push bacchilu/pdf-generator:4.1.1

docker run --rm -it -p 8000:3000 bacchilu/pdf-generator
```

Test in this way:

```bash
curl -X POST "http://localhost:8000/gnurun/delivery" \
     -H "Content-Type: application/json" \
     -d '{
       "delivery": {
         "id": 428,
         "creation_date": "2025-01-16T08:12:40.000Z",
         "boxes": [
           {
             "id": 453,
             "box_height_cm": "10",
             "box_length_cm": "0",
             "box_width_cm": "0",
             "box_qty": 0,
             "products": [{
               "quantity": 60,
               "p_code": "TEST"
             }]
           }
         ]
       },
       "company_name": "Life365 Italy",
       "courier_name": "BRT",
       "courier_tracking": "123456789"
     }' \
     -o output.pdf
```
