import React, { useState } from 'react';
import { Modal, View, Platform, StyleSheet, Alert, Image } from 'react-native';
import { IconButton, Button, TextInput } from 'exoflex';
import * as ImagePicker from 'expo-image-picker';
import type { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';

export const NewPost = () => null;

export function NewPostButton() {
  let [isModalVisible, setModalVisible] = useState(false);
  let [image, setImage] = useState<ImageInfo | null>(null);
  let [caption, setCaption] = useState('');

  let closeModal = () => setModalVisible(false);

  let pickImage = async () => {
    try {
      let { status } = await ImagePicker.requestCameraRollPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Sorry, we need camera roll permissions to make this work',
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 1,
      });

      if (!result.cancelled) {
        let { cancelled, ...imageInfo } = result;
        setModalVisible(true);
        setImage(imageInfo);
        return;
      }

      closeModal();
    } catch (e) {
      console.log('>>error', e);
    }
  };

  return (
    <>
      <IconButton
        icon="plus-box-outline"
        size={24}
        color="#8f8f90"
        onPress={pickImage}
      />
      <Modal
        visible={isModalVisible}
        hardwareAccelerated
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.root}>
          <View style={styles.header}>
            <IconButton icon="close" size={28} onPress={closeModal} />
            <Button
              accessibilityStates
              preset="invisible"
              onPress={() => {}}
              style={{ minWidth: 0, width: 120 }}
            >
              Share
            </Button>
          </View>
          <View style={styles.contentWrapper}>
            <Image source={{ uri: image?.uri ?? '' }} style={styles.preview} />
            <TextInput
              multiline
              mode="flat"
              placeholder="Write a caption"
              value={caption}
              onChangeText={setCaption}
              containerStyle={{ marginHorizontal: 16, flex: 1 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#f2f2f2',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingTop: Platform.select({ ios: 36, default: 0 }),
  },
  contentWrapper: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    width: 80,
    height: 80,
  },
});
