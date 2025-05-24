import React from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  InteractionManager,
} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
const { width, height } = Dimensions.get('window');
const generateItems = (start, count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: (start + i).toString(),
    uri: `https://picsum.photos/id/${start + i}/200/200`,
  }));
};

export default function App() {
  const items = React.useMemo(() => generateItems(1, 16), []);
  const grid = React.useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => items.slice(i*4, (i+1)*4))
  }, [items])
  const numCols = grid[0].length;
  const numRows = grid.length;
  const [[offsetX, offsetY], setOffsetXY] = React.useState([1,1]);
  const rX = React.useCallback((x) => {
    return ((x % numRows) + numRows) % numRows;
  }, [numRows])
  const rY = React.useCallback((y) => {
    return ((y % numCols) + numCols) % numCols;
  }, [numCols])
  const gW = React.useCallback((x, y) => {
    return grid[rX(offsetX + x)][rY(offsetY + y)];
  }, [grid, rX, rY, offsetX, offsetY])
  const current = React.useMemo(() => {
    return [gW(0, 0), gW(0, 1), gW(1, 0), gW(1, 1)]
  }, [gW]);
  const update = React.useCallback((x, y) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
    setOffsetXY(([offX, offY]) => {
      return [rX(offX + x), rY(offY + y)]
    });
      })
    });
  }, [rX, rY])
  const swipeGesture = Gesture.Pan()
    .onEnd((e) => {
      const { translationX, translationY } = e;
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        if (translationX > 0) {
          update(0, -1)
        } else {
          update(0, 1)
        }
      } else {
        // Vertical swipe
        if (translationY > 0) {
          update(-1, 0)
        } else {
          update(1, 0)
        }
      }
    });


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
    
    <Text style={{ color: 'white', fontSize: 30 }}>{offsetX}{offsetY}</Text>
      {/* Top control */}
      <TouchableOpacity style={[styles.control, styles.top]} onPress={() => update(-1, 0)}>
        <Text style={styles.controlText}>↑</Text>
      </TouchableOpacity>

      {/* Left control */}
      <TouchableOpacity style={[styles.control, styles.left]} onPress={() => update(0, -1)}>
        <Text style={styles.controlText}>←</Text>
      </TouchableOpacity>

      {/* Right control */}
      <TouchableOpacity style={[styles.control, styles.right]} onPress={() => update(0, 1)}>
        <Text style={styles.controlText}>→</Text>
      </TouchableOpacity>

      {/* Gallery grid */}
      <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1, flexDirection: 'colum' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Image source={{ uri: current[0].uri }} style={styles.image} />
          <Image source={{ uri: current[1].uri }} style={styles.image} />
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Image source={{ uri: current[2].uri }} style={styles.image} />
          <Image source={{ uri: current[3].uri }} style={styles.image} />
        </View>
      </View>
      </GestureDetector>

      {/* Bottom control */}
      <TouchableOpacity style={[styles.control, styles.bottom]} onPress={() => update(1, 0)}>
        <Text style={styles.controlText}>↓</Text>
      </TouchableOpacity>
    </View>
    </GestureHandlerRootView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: width / 2,
    height: height / 2,
  },
  control: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    zIndex: 1,
    borderRadius: 20,
  },
  controlText: {
    color: '#fff',
    fontSize: 24,
  },
  top: {
    top: 20,
    alignSelf: 'center',
  },
  bottom: {
    bottom: 20,
    alignSelf: 'center',
  },
  left: {
    left: 20,
    top: height / 2 - 20,
  },
  right: {
    right: 20,
    top: height / 2 - 20,
  },
});
