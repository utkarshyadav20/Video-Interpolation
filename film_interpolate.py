import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import argparse
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import mediapy as media
import cv2
# Add argument parsing
parser = argparse.ArgumentParser()
parser.add_argument('-i1', '--image1', required=True)
parser.add_argument('-i2', '--image2', required=True)
parser.add_argument('-o', '--output', required=True)
args = parser.parse_args()

# Load model
model = hub.load("https://tfhub.dev/google/film/1")


_UINT8_MAX_F = float(np.iinfo(np.uint8).max)
TARGET_SIZE = (256, 256)  # Consistent image size
TIMES_TO_INTERPOLATE = 6  # Number of recursive interpolations


def load_image(path):
    image_data = tf.io.read_file(path)
    image = tf.io.decode_image(image_data, channels=3)
    image = tf.cast(image, tf.float32).numpy()/_UINT8_MAX_F
    image=cv2.resize(image, TARGET_SIZE)
    return image

def main():
    image1 = load_image(args.image1)
    image2 = load_image(args.image2)
    
    # Generate interpolated frames
    frames = []
    for i in range(1):
        t = (i + 1) / (1 + 1)
        inputs = {
            'time': np.array([[t]], dtype=np.float32),
            'x0': np.expand_dims(image1, axis=0),
            'x1': np.expand_dims(image2, axis=0)
        }
        frame = model(inputs)['image'][0].numpy()
        frames.append(frame)
    
    # Create final video with input frames
    all_frames = [image1, *frames, image2]
    media.write_video(args.output, all_frames, fps=2)

if __name__ == "__main__":
    main()