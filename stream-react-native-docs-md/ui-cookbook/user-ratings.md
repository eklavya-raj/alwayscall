# User ratings

## Introduction

Collect user feedback at call end to improve your product. Ratings appear in the dashboard stats screen and help Stream improve service quality.

## Best Practices

- **Show after call ends** - Prompt for feedback immediately after calls
- **Keep it simple** - Use 1-5 star ratings for quick feedback
- **Add optional comments** - Allow users to provide detailed feedback
- **Include custom data** - Add context like user role or call type

## Submit Feedback API

Use the SDK feedback API (viewable in dashboard call stats):

```ts
await call.submitFeedback(
  rating, // a rating from 1 to 5,
  {
    reason: "I could not select my external camera from the UI", // some text feedback (optional)
    custom: {
      role: "patient",
    },
  },
);
```

## Example

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { useCall } from '@stream-io/video-react-native-sdk';
import Star from '../assets/Star';
import Close from '../assets/Close';

const FeedbackModal: = () => {
  const call = useCall();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleRatingPress = (rating: number) => {
    setSelectedRating(rating);
    await call
      ?.submitFeedback(Math.min(Math.max(1, rating), 5), {
        reason: '<no-message-provided>',
      })
      .catch((err) => console.warn('Failed to submit call feedback', err));
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose}>
        <View style={[styles.modal]}>
          <View style={styles.top}>
            <View style={styles.topRight}>
              <TouchableOpacity onPress={onClose} style={[styles.closeButton]}>
                <IconWrapper>
                  <Close
                    color={colors.typeSecondary}
                    size={variants.roundButtonSizes.sm}
                  />
                </IconWrapper>
              </TouchableOpacity>
            </View>
          </View>
          <Image source={require('../assets/feedbackLogo.png')} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>We Value Your Feedback!</Text>
            <Text style={styles.subtitle}>
              Tell us about your video call experience.
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                onPress={() => handleRatingPress(rating)}
                style={[styles.ratingButton]}
              >
                <Star
                  color={
                    selectedRating && selectedRating >= rating
                      ? colors.iconAlertSuccess
                      : colors.typeSecondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottom}>
            <View style={styles.left}>
              <Text style={styles.text}>Very Bad</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.text}>Very Good</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
```


---

This page was last updated at 2026-04-17T17:34:03.123Z.

For the most recent version of this documentation, visit [https://getstream.io/video/docs/react-native/ui-cookbook/user-ratings/](https://getstream.io/video/docs/react-native/ui-cookbook/user-ratings/).