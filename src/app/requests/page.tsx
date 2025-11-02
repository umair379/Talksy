// Friend request status ko realtime track karna
useEffect(() => {
  if (!me) return;

  const q = query(collection(db, "friendRequests"));
  const unsub = onSnapshot(q, (snap) => {
    const reqs: Record<string, string> = {};
    snap.docs.forEach((d) => {
      const data = d.data();
      if (data.from === me.uid) {
        reqs[data.to] = data.status; // Sent by me
      } else if (data.to === me.uid) {
        reqs[data.from] = data.status; // Received by me
      }
    });
    setRequests(reqs);
  });

  return () => unsub();
}, [me]);