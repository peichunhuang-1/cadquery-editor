FROM condaforge/miniforge3:latest

ENV DEBIAN_FRONTEND=noninteractive
ENV CONDA_ENV_NAME=cqenv

RUN conda create -n $CONDA_ENV_NAME -c conda-forge -c cadquery \
    python=3.10 cadquery fastapi uvicorn

RUN conda run -n $CONDA_ENV_NAME pip install git+https://github.com/meadiode/cq_gears.git@main

RUN apt-get update && apt-get install -y libgl1
RUN conda run -n $CONDA_ENV_NAME pip install ezdxf==1.3.0

WORKDIR /app
COPY . .
# VOLUME ["/app"]
EXPOSE 8000

CMD ["conda", "run", "--no-capture-output", "-n", "cqenv", "python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
