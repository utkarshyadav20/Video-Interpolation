import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import argparse
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np
import mediapy as media
import cv2

# Argument parsing
parser = argparse.ArgumentParser()
parser.add_argument('-i1', '--image1', required=True, help='Path to first image')
parser.add_argument('-i2', '--image2', required=True, help='Path to second image')
parser.add_argument('-o', '--output', required=True, help='Output video file')
args = parser.parse_args()

# Load FILM model
model = hub.load("https://tfhub.dev/google/film/1")
_UINT8_MAX_F = float(np.iinfo(np.uint8).max)
TARGET_SIZE = (512, 512)
TIMES_TO_INTERPOLATE = 6

def load_image(path):
    image_data = tf.io.read_file(path)
    image = tf.io.decode_image(image_data, channels=3)
    image = tf.cast(image, tf.float32).numpy() / _UINT8_MAX_F
    image = cv2.resize(image, TARGET_SIZE)
    return image

def _pad_to_align(x, align=64):
    height, width = x.shape[:2]
    height_pad = (align - height % align) if height % align != 0 else 0
    width_pad = (align - width % align) if width % align != 0 else 0
    padded_x = tf.image.pad_to_bounding_box(
        x, height_pad // 2, width_pad // 2, height + height_pad, width + width_pad
    )
    return padded_x.numpy()

def generate_interpolated_frames(image1, image2, num_recursions):
    interpolated_frames = []
    interpolator = Interpolator()
    for i in range(1, num_recursions + 1):
        t = i / (num_recursions + 1)
        inputs = {
            'time': np.array([[t]], dtype=np.float32),
            'x0': np.expand_dims(image1, axis=0),
            'x1': np.expand_dims(image2, axis=0)
        }
        frame = model(inputs)['image'][0].numpy()
        interpolated_frames.append(frame)
    return interpolated_frames

class Interpolator:
    def __init__(self, align=64):
        self._model = hub.load("https://tfhub.dev/google/film/1")
        self._align = align
    
    def __call__(self, x0, x1, dt):
        x0, x1 = _pad_to_align(x0), _pad_to_align(x1)
        inputs = {'x0': x0, 'x1': x1, 'time': dt[..., np.newaxis]}
        result = self._model(inputs, training=False)
        return result['image'].numpy()

def main():
    image1 = load_image(args.image1)
    image2 = load_image(args.image2)
    frames = [image1] + generate_interpolated_frames(image1, image2, TIMES_TO_INTERPOLATE) + [image2]
    media.write_video(args.output, frames, fps=30)

if __name__ == "__main__":
    main()
