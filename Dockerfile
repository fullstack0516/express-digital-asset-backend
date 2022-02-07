FROM launcher.gcr.io/google/nodejs

RUN install_node v15.14.0

# Create app directory
RUN mkdir -p /app
WORKDIR /app

COPY . /app

# Add FFMPEG
# RUN apt update
# RUN apt install ffmpeg -y
# RUN ffmpeg -version

RUN npm --unsafe-perm install
RUN npm run build

# Start the app.
EXPOSE 8080
CMD ["npm", "run", "start"]
